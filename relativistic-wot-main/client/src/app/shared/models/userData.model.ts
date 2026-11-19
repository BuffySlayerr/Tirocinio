export interface PropertiesUserData {
  email: string;
  firstName: string;
  lastName: string;
}
export class UserData {
  date_joined: Date;
  email: string;
  first_name: string;
  full_name: string;
  groups: any;
  id: number;
  is_active: true;
  is_staff: false;
  is_superuser: false;
  last_login: Date;
  last_name: string;
  properties: PropertiesUserData;
  user_permissions: any;
  username: string;
}
