import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1746106503794 implements MigrationInterface {
    name = 'Init1746106503794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "age" integer NOT NULL`);
    }

}
