export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: UserRole | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly name: string | null;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name ?? null;
    this.role = props.role ?? UserRole.User;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const createdAt = props.createdAt ?? new Date();
    const userProps: UserProps = {
      id: props.id.trim(),
      email: normalizeEmail(props.email),
      passwordHash: props.passwordHash.trim(),
      name: props.name ? normalizeName(props.name) : null,
      role: props.role ?? UserRole.User,
      createdAt,
      updatedAt: props.updatedAt ?? createdAt,
    };

    validateUserStructure(userProps);

    return new User(userProps);
  }

  updateProfile(props: { name?: string }): User {
    const nextUser = new User({
      ...this.toJSON(),
      name: props.name !== undefined ? normalizeName(props.name) : this.name,
      updatedAt: new Date(),
    });

    validateUserStructure(nextUser.toJSON());
    return nextUser;
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPublicJSON(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...publicUser } = this.toJSON();
    return publicUser;
  }

  toJwtPayload(): UserJwtPayload {
    return {
      sub: this.id,
      email: this.email,
      role: this.role,
    };
  }
}

export function validateUserStructure(user: UserProps): void {
  if (!user.id) {
    throw new Error('User.id is required.');
  }

  if (!isValidEmail(user.email)) {
    throw new Error('User.email must be a valid email address.');
  }

  if (!user.passwordHash || user.passwordHash.length < 20) {
    throw new Error('User.passwordHash must look like a hashed password.');
  }

  if (user.name !== null && user.name !== undefined && user.name.length < 2) {
    throw new Error('User.name must contain at least 2 characters.');
  }

  if (!(user.createdAt instanceof Date) || Number.isNaN(user.createdAt.getTime())) {
    throw new Error('User.createdAt must be a valid date.');
  }

  if (!(user.updatedAt instanceof Date) || Number.isNaN(user.updatedAt.getTime())) {
    throw new Error('User.updatedAt must be a valid date.');
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
