import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard que dispara la JwtStrategy registrada en AuthModule.
// Al usarse explícitamente por ruta (no global) permite dejar endpoints públicos
// (ej. listado de comercios) sin @UseGuards.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
