import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais de um usuário.
   * @param email - Email do usuário
   * @param password - Senha em texto plano
   * @returns Objeto do usuário sem a senha
   * @throws UnauthorizedException - Se o email ou a senha forem inválidos
  */
  async validateUser(email: string, password: string) {
    this.logger.log(`Validating user with email: ${email}`);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.logger.warn(`User not found: ${email}`);
      throw new UnauthorizedException('User not found');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User validated successfully: ${email}`);
    const { password: pwd, ...result } = user;
    return result;
  }

  /**
   * Gera um token JWT para o usuário autenticado.
   * @param user - Objeto do usuário (já validado)
   * @returns Objeto contendo o access_token
  */
  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    this.logger.log(`Generating token for user ID: ${user.id}`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
