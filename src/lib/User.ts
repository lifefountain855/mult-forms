import { isSupabaseConfigured, supabase } from './supabase';

export interface SurveyData {
  id: string;
  submitted: boolean;
  submitTimes: number;
  submittedScreen?: boolean;
  passedScreen?: boolean;
  screenData?: Record<string, any>;
  data?: Record<string, any>;
}

export interface DataProps {
  [key: string]: SurveyData;
}

const emptySurveyState = (id: string): SurveyData => ({
  id,
  submitted: false,
  submitTimes: 0,
  submittedScreen: false,
  passedScreen: false,
  screenData: {},
  data: {},
});

export default class UserProfile {
  id: string;
  private _admin: boolean;
  private _surveyData: DataProps;

  constructor(id: string = '', admin: boolean = false, surveyData: DataProps = {}) {
    this.id = id;
    this._admin = admin;
    this._surveyData = surveyData;
  }

  get admin(): boolean {
    return this._admin;
  }

  set admin(value: boolean) {
    this._admin = value;
  }

  get surveyData(): DataProps {
    return this._surveyData;
  }

  set surveyData(value: DataProps) {
    this._surveyData = value;
  }

  async save(): Promise<void> {
    if (!this.id || !isSupabaseConfigured()) {
      return;
    }

    for (const surveyKey of Object.keys(this._surveyData ?? {})) {
      await this.saveSurveyState(surveyKey, this._surveyData[surveyKey]);
    }
  }

  async saveSurveyState(surveyKey: string, partial: Partial<SurveyData> = {}): Promise<SurveyData> {
    const baseState = this._surveyData?.[surveyKey] ?? emptySurveyState(surveyKey);
    const nextState: SurveyData = {
      ...baseState,
      ...partial,
      id: surveyKey,
      submitted: partial.submitted ?? baseState.submitted ?? false,
      submitTimes: partial.submitTimes ?? baseState.submitTimes ?? 0,
      submittedScreen: partial.submittedScreen ?? baseState.submittedScreen ?? false,
      passedScreen: partial.passedScreen ?? baseState.passedScreen ?? false,
      screenData: partial.screenData ?? baseState.screenData ?? {},
      data: partial.data ?? baseState.data ?? {},
    };

    this._surveyData = {
      ...this._surveyData,
      [surveyKey]: nextState,
    };

    if (!this.id || !isSupabaseConfigured()) {
      return nextState;
    }

    const payload = {
      user_id: this.id,
      survey_key: surveyKey,
      submitted: nextState.submitted,
      submit_times: nextState.submitTimes,
      submitted_screen: nextState.submittedScreen ?? false,
      passed_screen: nextState.passedScreen ?? false,
      screen_data: nextState.screenData ?? {},
      survey_data: nextState.data ?? {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('survey_state')
      .upsert(payload, { onConflict: 'user_id,survey_key' })
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to save survey response: ${error.message}`);
    }

    if (data) {
      const normalized = {
        id: data.survey_key ?? surveyKey,
        submitted: Boolean(data.submitted),
        submitTimes: Number(data.submit_times ?? 0),
        submittedScreen: Boolean(data.submitted_screen),
        passedScreen: Boolean(data.passed_screen),
        screenData: data.screen_data ?? {},
        data: data.survey_data ?? {},
      };

      this._surveyData[surveyKey] = normalized;
      return normalized;
    }

    return nextState;
  }

  static async initLoad(): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      return new UserProfile('', false, {});
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Unable to load your session: ${sessionError.message}`);
    }

    if (!sessionData.session?.user?.id) {
      return new UserProfile('', false, {});
    }

    const userId = sessionData.session.user.id;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin, email, full_name')
      .eq('id', userId)
      .maybeSingle();

    const admin = Boolean(profileData?.is_admin ?? false);

    const { data: stateData, error: stateError } = await supabase
      .from('survey_state')
      .select('*')
      .eq('user_id', userId);

    if (profileError || stateError) {
      throw new Error(`Unable to load your profile: ${profileError?.message ?? stateError?.message ?? 'unknown error'}`);
    }

    const surveyData: DataProps = {};
    for (const row of stateData ?? []) {
      surveyData[row.survey_key] = {
        id: row.survey_key,
        submitted: Boolean(row.submitted),
        submitTimes: Number(row.submit_times ?? 0),
        submittedScreen: Boolean(row.submitted_screen),
        passedScreen: Boolean(row.passed_screen),
        screenData: row.screen_data ?? {},
        data: row.survey_data ?? {},
      };
    }

    return new UserProfile(userId, admin, surveyData);
  }
}
