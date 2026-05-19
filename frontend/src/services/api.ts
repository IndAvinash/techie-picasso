
export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
export interface AuthResponse {
  message: string;
  token?: string;
}

export const login = async (data:LoginData):Promise<AuthResponse>=>{
    const resp = {
        message:"",
        token:""
    }
    return resp;
}

