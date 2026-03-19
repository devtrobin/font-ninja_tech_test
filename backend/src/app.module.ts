import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article } from './articles/article.model';
import { ArticlesModule } from './articles/articles.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Scrapper } from './scrappers/scrapper.model';
import { ScrappersModule } from './scrappers/scrappers.module';

const databaseModule =
  process.env.DB_ENABLED === 'false'
    ? []
    : [
        SequelizeModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            dialect: 'mysql' as const,
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: Number(configService.get<string>('DB_PORT', '3306')),
            username: configService.get<string>('DB_USERNAME', 'app'),
            password: configService.get<string>('DB_PASSWORD', 'app'),
            database: configService.get<string>('DB_NAME', 'font_ninja'),
            autoLoadModels: true,
            synchronize: true,
            models: [Article, Scrapper],
          }),
        }),
      ];

const featureModules =
  process.env.DB_ENABLED === 'false' ? [] : [ArticlesModule, ScrappersModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseModule,
    ...featureModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
