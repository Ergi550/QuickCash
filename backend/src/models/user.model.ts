/**
 * User roles in the system
 */
export enum UserRole{
    CUSTOMER = 'customer',
    STAFF = 'staff',
    MANAGER = 'manager'
}

//USER INTERFACE

export interface User {
    id : string;
    username: string;
    email:string;
    password:string;//hashed
    role:UserRole;
    firstName:string;
    lastName:string;
    phone?:string;
    createdAt:Date |string;
    updatedAt:Date |string;
    isActive:boolean;
}
//User response

export interface UserResponse{
    id:string;
    username:string;
    email:string;
    role:UserRole;
    firstName:string;
    lastName:string;
    phone?:string;
}

//Login credentials
export interface LoginCredentials{
    email : string;
    password:string;
}

//*JWT Payload 
export interface JWTPayload {
    userId : string;
    email:string;
    role:UserRole;
}

//Auth response 
export interface AuthResponse {
    token : string;
    user :UserResponse;
}