import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  dob: Date;
  phone: string;
  address: string;
  state: string;
  zip: string;
  country: string;
  gender: string;
  parentGuardian?: string;
  startDate: Date;
  password: string;
  roles: string[];
  createdAt: Date;
  avatar?: string;
  graduationDate?: Date;
  refreshToken?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: false },
  email:     { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
},
  dob:       { type: Date, required: false },
  phone:     { type: String, required: false },
  address:   { type: String, required: false },
  state:     { type: String, required: false },
  zip:       { type: String, required: false },
  country:   { type: String, required: false },
  gender:    { type: String, required: false },
  parentGuardian: { type: String },
  startDate: { type: Date, required: false },
  graduationDate: { type: Date },
  password:  { type: String, required: true },
  roles: {
    type: [String],
    enum: ['user', 'teacher', 'admin'],
    default: ['user']
},
  createdAt: { type: Date, default: Date.now },
  avatar:    { type: String, default: 'https://picsum.dev/300/200' },
  refreshToken: { type: String},
  
  
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
