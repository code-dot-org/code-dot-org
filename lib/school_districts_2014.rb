# Get all districts
def get_all_school_districts()
  return SCHOOL_DISTRICTS_2014.sort_by {|_id, attributes| attributes[:name]}
end

def get_all_school_districts_in_state(state)
  return SCHOOL_DISTRICTS_2014.select{|_id, attributes| attributes[:state] == state }.sort_by {|_id, attributes| attributes[:name]}
end

SCHOOL_DISTRICTS_2014 = {
  '100002': {'name': 'ALABAMA YOUTH SERVICES', 'city': 'MT MEIGS', 'state': 'AL', 'zip': '36057', 'ecs_app': 'application'},
  '100005': {'name': 'ALBERTVILLE CITY', 'city': 'ALBERTVILLE', 'state': 'AL', 'zip': '35950', 'ecs_app': 'application'},
  '100006': {'name': 'MARSHALL COUNTY', 'city': 'GUNTERSVILLE', 'state': 'AL', 'zip': '35976', 'ecs_app': 'application'},
  '100007': {'name': 'HOOVER CITY', 'city': 'HOOVER', 'state': 'AL', 'zip': '35243', 'ecs_app': 'application'},
  '100008': {'name': 'MADISON CITY', 'city': 'MADISON', 'state': 'AL', 'zip': '35758', 'ecs_app': 'application'},
  '100009': {'name': 'AL INST DEAF AND BLIND', 'city': 'TALLADEGA', 'state': 'AL', 'zip': '35161', 'ecs_app': 'exception'},
  '100011': {'name': 'LEEDS CITY', 'city': 'LEEDS', 'state': 'AL', 'zip': '35094', 'ecs_app': 'application'},
  '100012': {'name': 'BOAZ CITY', 'city': 'BOAZ', 'state': 'AL', 'zip': '35957', 'ecs_app': 'application'},
  '100013': {'name': 'TRUSSVILLE CITY', 'city': 'TRUSSVILLE', 'state': 'AL', 'zip': '35173', 'ecs_app': 'application'},
  '100015': {'name': 'SAFETYNET ACADEMY', 'city': 'BIRMINGHAM', 'state': 'AL', 'zip': '35210', 'ecs_app': 'application'},
  '100016': {'name': 'BRYCE ADOLESCENT SCHOOL', 'city': 'TUSCALOOSA', 'state': 'AL', 'zip': '35401', 'ecs_app': 'application'},
  '100018': {'name': 'ALABAMA SCHOOL OF FINE ARTS', 'city': 'BIRMINGHAM', 'state': 'AL', 'zip': '35203', 'ecs_app': 'application'},
  '100019': {'name': 'UCP OF GREATER BIRMINGHAM', 'city': 'BIRMINGHAM', 'state': 'AL', 'zip': '35234', 'ecs_app': 'application'},
  '100020': {'name': 'BOYD SCHOOL', 'city': 'GREEN POND', 'state': 'AL', 'zip': '35074', 'ecs_app': 'application'},
  '100021': {'name': 'BREWERS PORCH CHILDRENS CENTER', 'city': 'TUSCALOOSA', 'state': 'AL', 'zip': '35404', 'ecs_app': 'application'},
  '100022': {'name': 'THREE SPRINGS COURTLAND SCH', 'city': 'COURTLAND', 'state': 'AL', 'zip': '35618', 'ecs_app': 'application'},
  '100023': {'name': 'THREE SPRINGS MADISON SCH', 'city': 'MADISON', 'state': 'AL', 'zip': '35758', 'ecs_app': 'application'},
  '100024': {'name': 'THREE SPRINGS NEW BEGINNINGS', 'city': 'MADISON', 'state': 'AL', 'zip': '35763', 'ecs_app': 'application'},
  '100026': {'name': 'THREE SPRINGS NEW TUSKEGEE', 'city': 'TUSKEGEE', 'state': 'AL', 'zip': '36083', 'ecs_app': 'application'},
  '100028': {'name': 'THREE SPRINGS NEW TUSKEGEE', 'city': 'GREEN POND', 'state': 'AL', 'zip': '35074', 'ecs_app': 'waitlist'},
  '100029': {'name': 'THREE SPRINGS NEW DIRECTION', 'city': 'OWENS CROSS ROADS', 'state': 'AL', 'zip': '35806', 'ecs_app': 'waitlist'},
  '400259': {'name': 'SOUTHGATE ACADEMY  INC.', 'city': 'TUCSON', 'state': 'AZ', 'zip': '85706', 'ecs_app': 'waitlist'},
  '400260': {'name': 'TAG ELEMENTARY  INC.', 'city': 'TUCSON', 'state': 'AZ', 'zip': '85748', 'ecs_app': 'waitlist'},
  '400261': {'name': 'EASTPOINTE HIGH SCHOOL  INC.', 'city': 'TUCSON', 'state': 'AZ', 'zip': '85710', 'ecs_app': 'waitlist'},
  '400263': {'name': 'PATAGONIA MONTESSORI ELEMENTARY SCHOOL', 'city': 'PATAGONIA', 'state': 'AZ', 'zip': '85624', 'ecs_app': 'waitlist'},
  '400264': {'name': 'SANTA CRUZ VALLEY OPPORTUNITIES IN EDUCATION  INC.', 'city': 'TUBAC', 'state': 'AZ', 'zip': '85646', 'ecs_app': 'application'},
  '400266': {'name': 'PACE PREPARATORY ACADEMY  INC.', 'city': 'SEDONA', 'state': 'AZ', 'zip': '86336', 'ecs_app': 'application'},
  '1100017': {'name': 'THE NEXT STEP PCS WASHINGTON', 'city': 'WASHINGTON', 'state': 'DC', 'zip': '20009', 'ecs_app': 'application'},
  '1100018': {'name': 'OPTIONS PCS WASHINGTON', 'city': 'WASHINGTON', 'state': 'DC', 'zip': '20002', 'ecs_app': 'application'},
  '1100019': {'name': 'WASHINGTON LATIN PCS  WASHINGTON', 'city': 'WASHINGTON', 'state': 'DC', 'zip': '20011', 'ecs_app': 'application'},
  '1100020': {'name': 'ROOTS PCS WASHINGTON', 'city': 'WASHINGTON', 'state': 'DC', 'zip': '20011', 'ecs_app': 'application'},
  '7200030': {'name': 'PUERTO RICO DEPARTMENT OF EDUCATION', 'city': 'HATO REY', 'state': 'PR', 'zip': '919', 'ecs_app': 'exception'},
}
