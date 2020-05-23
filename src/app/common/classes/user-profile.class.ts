export interface IUserProfileAuth0 {
    given_name: string;
    family_name: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
    email: string;
    email_verified: boolean;
    sub: string;
}
export interface IUserProfile {
    name: string;
    lastname: string;
    nickname: string;
    fullname: string;
    picture: string;
    updatedAt: string;
    email: string;
    emailVerified: boolean;
    sub: string;
}
export class UserProfile implements IUserProfile {
    name: string;
    lastname: string;
    nickname: string;
    fullname: string;
    picture: string;
    updatedAt: string;
    email: string;
    emailVerified: boolean;
    sub: string;

    constructor(properties: IUserProfile) {
        Object.assign(this, properties);
    }

    static fromLinkedin(data: IUserProfileAuth0) {
        return new UserProfile({
            email: data.email,
            emailVerified: data.email_verified,
            fullname: data.name,
            lastname: data.family_name,
            picture: data.picture,
            name: data.given_name,
            nickname: data.nickname,
            updatedAt: data.updated_at,
            sub: data.sub
        });
    }
}
