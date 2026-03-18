import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const databaseModule =
  process.env.DB_ENABLED === 'false'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql' as const,
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: Number(configService.get<string>('DB_PORT', '3306')),
            username: configService.get<string>('DB_USERNAME', 'app'),
            password: configService.get<string>('DB_PASSWORD', 'app'),
            database: configService.get<string>('DB_NAME', 'font_ninja'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
      ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
