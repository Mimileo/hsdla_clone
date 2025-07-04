import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";

export async function findOrCreateUser(email: string, otherUserData = {}): Promise<IUser> {
  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Temporary password (must hash!)
    const tempPassword = "student";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      ...otherUserData,
    });

    await user.save();
  }

  return user;
}
