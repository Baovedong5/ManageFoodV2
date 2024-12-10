import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderTable1733827720173 implements MigrationInterface {
    name = 'UpdateOrderTable1733827720173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentRef" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentRef"`);
    }

}
