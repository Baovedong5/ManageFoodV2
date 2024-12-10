import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAccountTable1733819063608 implements MigrationInterface {
    name = 'UpdateAccountTable1733819063608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" ADD "address" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD "phoneNumber" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "address"`);
    }

}
