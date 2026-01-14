  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { AuthModule } from './auth/auth.module';
  import { User } from './auth/entity/user.entity';

  @Module({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres', 
        host: 'ep-long-fog-a4igcoqn-pooler.us-east-1.aws.neon.tech', 
        port: 5432, 
        username: 'neondb_owner',
        password: 'npg_KyhUm0lPYTI4',
        database: 'neondb',
        ssl: {
          rejectUnauthorized: false, 
        },
        entities: [User],
        synchronize: true, 
      }),
      AuthModule,
    ],
  })
  export class AppModule {}