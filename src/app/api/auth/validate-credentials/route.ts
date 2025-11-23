import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '~/libs/typeorm';
import { User } from '~/entities/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'InvalidPassword', message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Initialize database connection
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    // Find user by username
    const user = await userRepository.findOne({
      where: { UserName: username, IsActive: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'UserNotFound', message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.UserPass);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'InvalidPassword', message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Credentials are valid
    return NextResponse.json(
      { valid: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'ValidationError', message: 'An error occurred during validation' },
      { status: 500 }
    );
  }
}

