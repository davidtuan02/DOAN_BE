import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744448264136 implements MigrationInterface {
    name = 'Init1744448264136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_attachment_task"`);
        await queryRunner.query(`ALTER TABLE "attachment" RENAME COLUMN "originalName" TO "originalname"`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_f7c799f3a6a9bd023612b0cafed" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_f7c799f3a6a9bd023612b0cafed"`);
        await queryRunner.query(`ALTER TABLE "attachment" RENAME COLUMN "originalname" TO "originalName"`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_attachment_task" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
