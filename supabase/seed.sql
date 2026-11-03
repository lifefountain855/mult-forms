insert into public.surveys (
  link,
  name,
  description,
  long_description,
  author,
  visible,
  requires_screen,
  allowed_submits,
  screen,
  questions,
  publish_year,
  publish_month,
  publish_day
)
values
(
  'minichem',
  'MiniChem',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students. Market research for a functional chemical resale company focused on students.Market research for a functional chemical resale company focused on students.',
  'kevin sapp',
  true,
  true,
  2,
  $screen$[
    {"id":"q_US","question":"Do you live in the united states?","type":"radio","options":{"t":"yes","f":"no"},"allowed":["yes"]},
    {"id":"q_IDFL","question":"If yes, what state do you live in?","type":"dropdown","options":{"al":"Alabama","ak":"Alaska","az":"Arizona","ar":"Arkansas","ca":"California","co":"Colorado","ct":"Connecticut","de":"Delaware","fl":"Florida","ga":"Georgia","hi":"Hawaii","id":"Idaho","il":"Illinois","in":"Indiana","ia":"Iowa","ks":"Kansas","ky":"Kentucky","la":"Louisiana","me":"Maine","md":"Maryland","ma":"Massachusetts","mi":"Michigan","mn":"Minnesota","ms":"Mississippi","mo":"Missouri","mt":"Montana","ne":"Nebraska","nv":"Nevada","nh":"New Hampshire","nj":"New Jersey","nm":"New Mexico","ny":"New York","nc":"North Carolina","nd":"North Dakota","oh":"Ohio","ok":"Oklahoma","or":"Oregon","pa":"Pennsylvania","ri":"Rhode Island","sc":"South Carolina","sd":"South Dakota","tn":"Tennessee","tx":"Texas","ut":"Utah","vt":"Vermont","va":"Virginia","wa":"Washington","wv":"West Virginia","wi":"Wisconsin","wy":"Wyoming"},"allowed":["id","fl"],"dependsOn":{"questionIndex":0,"value":"yes"}}
  ]$screen$::jsonb,
  $questions$[
    {"id":"q_often","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"},
    {"id":"q_7","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq2"}
  ]$questions$::jsonb,
  2026, 2, 9
),
(
  'MiniChem222',
  'MiniChem222',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'kevin sapp',
  false,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_8","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
),
(
  'hi1',
  'hi1',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'yours truly',
  true,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_9","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
),
(
  'hi2',
  'hi2',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'yours truly',
  true,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_10","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
),
(
  'hi2.2',
  'hi2.2',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'yours truly',
  true,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_11","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
),
(
  'hi2.3',
  'hi2.3',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'yours truly',
  true,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_12","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
),
(
  'hi3',
  'hi3',
  'Market research for a functional chemical resale company focused on students.',
  'Market research for a functional chemical resale company focused on students.',
  'yours truly',
  true,
  false,
  1,
  '[]'::jsonb,
  $questions$[{"id":"q_13","question":"How often do you clean your apartment?","type":"multi","subtypeM":"freq1"}]$questions$::jsonb,
  2026, 2, 9
)
on conflict (link) do update set
  name = excluded.name,
  description = excluded.description,
  long_description = excluded.long_description,
  author = excluded.author,
  visible = excluded.visible,
  requires_screen = excluded.requires_screen,
  allowed_submits = excluded.allowed_submits,
  screen = excluded.screen,
  questions = excluded.questions,
  publish_year = excluded.publish_year,
  publish_month = excluded.publish_month,
  publish_day = excluded.publish_day,
  updated_at = now();
