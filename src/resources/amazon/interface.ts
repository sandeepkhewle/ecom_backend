import { Document } from 'mongoose';

export default interface amazon extends Document {
    expires_in:  string,
    token_type:  string,
    refresh_token:  string,
    access_token:  string,
}
