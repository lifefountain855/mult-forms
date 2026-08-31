export interface SurveyData {
    id:string,
    submitted:boolean,
    submitTimes:number,
    submittedScreen?:boolean,
    passedScreen?:boolean,
    screenData?:{},
    data?:{},
}

export interface DataProps {
    [key: string]:SurveyData,
}

export default class UserProfile {
  id: number;
  private _admin: boolean;
  private _surveyData?: DataProps;

  constructor( id: number = 0, admin: boolean = false, surveyData?: DataProps,) {
    this.id = id;
    this._admin = admin;
    this._surveyData = surveyData;
  }

  get admin(): boolean {
    return this._admin;
  }
  set admin(value: boolean) {
    this._admin = value;
    this.save();
  }
  get surveyData(): DataProps | undefined {
    return this._surveyData;
  }
  set surveyData(value: SurveyData) {
    // this._surveyData[value["id"]] = value;
    // this.save();
  }

  load(): any {
    const savedString = localStorage.getItem("user");
    const userObj = savedString ? JSON.parse(savedString) : null;
    const userclass = new UserProfile(
      userObj.id,
      userObj["_admin"],
      userObj["_surveyData"]
    );
    return userclass;
  }

  save(): void {
    console.log("save called");
    localStorage.setItem("user", JSON.stringify(this));
  }

  check(): boolean {
    const savedString = localStorage.getItem("user");
    const userObj = savedString ? JSON.parse(savedString) : null;
    return userObj !== null;
  }

  static initLoad(): any {
    var user = new UserProfile(0,false,{});
    if (user.check()) {
      user = user.load();
      console.log(user);
    } else {
      user.save();
    }
    return user;
  }
}
