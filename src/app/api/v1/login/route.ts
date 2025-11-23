import { QueryTypes } from "sequelize";
import db from "~/libs/db";
import User from "~/models/user";

import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  try {
    const user: any = await User.findOne({
      where: {
        UserName: username
      }
    });

    if (!user) {
      // throw error user not found
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    if (bcrypt.compareSync(password, user.UserPass)) {
      return new Response(JSON.stringify(user), { status: 200 });
    } else {
      // throw error password does not match
      return new Response(
        JSON.stringify({ message: "Password does not match" }),
        { status: 401 }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
}