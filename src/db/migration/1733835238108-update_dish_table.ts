import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDishTable1733835238108 implements MigrationInterface {
    name = 'UpdateDishTable1733835238108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dish" ADD "category" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dish" DROP COLUMN "category"`);
    }

}
