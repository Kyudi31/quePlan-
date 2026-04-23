export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roles: UserRole[];
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roles?: UserRole[];
  status?: UserStatus;
  isEmailVerified?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserJwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  isEmailVerified: boolean;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly fullName: string;
  readonly roles: UserRole[];
  readonly status: UserStatus;
  readonly isEmailVerified: boolean;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.fullName = props.fullName;
    this.roles = props.roles;
    this.status = props.status;
    this.isEmailVerified = props.isEmailVerified;
    this.lastLoginAt = props.lastLoginAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const normalizedEmail = normalizeEmail(props.email);
    const normalizedFullName = props.fullName.trim();
    const roles = normalizeRoles(props.roles);
    const createdAt = props.createdAt ?? new Date();
    const updatedAt = props.updatedAt ?? createdAt;

    validateUserStructure({
      id: props.id,
      email: normalizedEmail,
      passwordHash: props.passwordHash,
      fullName: normalizedFullName,
      roles,
      status: props.status ?? UserStatus.Active,
      isEmailVerified: props.isEmailVerified ?? false,
      lastLoginAt: props.lastLoginAt ?? null,
      createdAt,
      updatedAt,
    });

    return new User({
      id: props.id,
      email: normalizedEmail,
      passwordHash: props.passwordHash,
      fullName: normalizedFullName,
      roles,
      status: props.status ?? UserStatus.Active,
      isEmailVerified: props.isEmailVerified ?? false,
      lastLoginAt: props.lastLoginAt ?? null,
      createdAt,
      updatedAt,
    });
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      fullName: this.fullName,
      roles: [...this.roles],
      status: this.status,
      isEmailVerified: this.isEmailVerified,
      lastLoginAt: this.lastLoginAt,
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
      roles: [...this.roles],
      status: this.status,
      isEmailVerified: this.isEmailVerified,
    };
  }
}

export function validateUserStructure(user: UserProps): void {
  if (!user.id.trim()) {
    throw new Error('User.id is required.');
  }

  if (!isValidEmail(user.email)) {
    throw new Error('User.email must be a valid email address.');
  }

  if (!user.passwordHash.trim()) {
    throw new Error('User.passwordHash is required.');
  }

  if (user.passwordHash.length < 20) {
    throw new Error('User.passwordHash must look like a hashed password.');
  }

  if (!user.fullName.trim()) {
    throw new Error('User.fullName is required.');
  }

  if (user.roles.length === 0) {
    throw new Error('User.roles must contain at least one role.');
  }

  if (!(user.createdAt instanceof Date) || Number.isNaN(user.createdAt.getTime())) {
    throw new Error('User.createdAt must be a valid date.');
  }

  if (!(user.updatedAt instanceof Date) || Number.isNaN(user.updatedAt.getTime())) {
    throw new Error('User.updatedAt must be a valid date.');
  }

  if (user.lastLoginAt !== null) {
    if (!(user.lastLoginAt instanceof Date) || Number.isNaN(user.lastLoginAt.getTime())) {
      throw new Error('User.lastLoginAt must be null or a valid date.');
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeRoles(roles?: UserRole[]): UserRole[] {
  return roles?.length ? [...new Set(roles)] : [UserRole.User];
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
