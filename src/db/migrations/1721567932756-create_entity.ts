import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntity1721567932756 implements MigrationInterface {
    name = 'CreateEntity1721567932756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."table_status_enum" AS ENUM('Available', 'Hidden', 'Reserved')`);
        await queryRunner.query(`CREATE TABLE "table" ("number" integer NOT NULL, "capacity" integer NOT NULL, "status" "public"."table_status_enum" NOT NULL DEFAULT 'Available', "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54d68e5dfeea1244c6642cd77f5" PRIMARY KEY ("number"))`);
        await queryRunner.query(`CREATE TABLE "guest" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "tableNumber" integer, "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57689d19445de01737dbc458857" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "socket_io" ("socketId" character varying NOT NULL, "accountId" integer, "guestId" integer, "userId" integer, CONSTRAINT "UQ_b17dd6ab6267081d4c22cfa3b61" UNIQUE ("accountId"), CONSTRAINT "UQ_99bb07552dc0b2c312f4c1a4839" UNIQUE ("guestId"), CONSTRAINT "PK_79231e1e9aeb88528c90c42a4d0" PRIMARY KEY ("socketId"))`);
        await queryRunner.query(`CREATE TYPE "public"."account_role_enum" AS ENUM('Employee', 'Owner', 'Guest')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "avatar" character varying, "role" "public"."account_role_enum" NOT NULL DEFAULT 'Employee', "refreshToken" character varying, "ownerId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."dish_status_enum" AS ENUM('Available', 'Unavailable', 'Hidden')`);
        await queryRunner.query(`CREATE TABLE "dish" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "status" "public"."dish_status_enum" NOT NULL DEFAULT 'Available', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dish_snapshot" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Available', "dishId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2fb9e66df9a56d31bb0bd3180ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('Pending', 'Processing', 'Rejected', 'Delivered', 'Paid')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "guestId" integer, "tableNumber" integer, "dishSnapshotId" integer NOT NULL, "quantity" integer NOT NULL, "orderHandlerId" integer, "status" "public"."order_status_enum" NOT NULL DEFAULT 'Pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_19377fc989dffe64a395163e9e" UNIQUE ("dishSnapshotId"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "guest" ADD CONSTRAINT "FK_2a1a7918edadc7e8157774f9335" FOREIGN KEY ("tableNumber") REFERENCES "table"("number") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "socket_io" ADD CONSTRAINT "FK_f3d58b006b93e752a0f380d2174" FOREIGN KEY ("userId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "socket_io" ADD CONSTRAINT "FK_99bb07552dc0b2c312f4c1a4839" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_72719f338bfbe9aa98f4439d2b4" FOREIGN KEY ("ownerId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dish_snapshot" ADD CONSTRAINT "FK_c58a28e46c0f9d13d6541cb9491" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_bf116a766ab3b0da256a9c587f0" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_1a2d890a0f209b92280dbf21945" FOREIGN KEY ("tableNumber") REFERENCES "table"("number") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_19377fc989dffe64a395163e9e4" FOREIGN KEY ("dishSnapshotId") REFERENCES "dish_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_55db3bb355470a1d74b34a53071" FOREIGN KEY ("orderHandlerId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_55db3bb355470a1d74b34a53071"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_19377fc989dffe64a395163e9e4"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_1a2d890a0f209b92280dbf21945"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_bf116a766ab3b0da256a9c587f0"`);
        await queryRunner.query(`ALTER TABLE "dish_snapshot" DROP CONSTRAINT "FK_c58a28e46c0f9d13d6541cb9491"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_72719f338bfbe9aa98f4439d2b4"`);
        await queryRunner.query(`ALTER TABLE "socket_io" DROP CONSTRAINT "FK_99bb07552dc0b2c312f4c1a4839"`);
        await queryRunner.query(`ALTER TABLE "socket_io" DROP CONSTRAINT "FK_f3d58b006b93e752a0f380d2174"`);
        await queryRunner.query(`ALTER TABLE "guest" DROP CONSTRAINT "FK_2a1a7918edadc7e8157774f9335"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "dish_snapshot"`);
        await queryRunner.query(`DROP TABLE "dish"`);
        await queryRunner.query(`DROP TYPE "public"."dish_status_enum"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_role_enum"`);
        await queryRunner.query(`DROP TABLE "socket_io"`);
        await queryRunner.query(`DROP TABLE "guest"`);
        await queryRunner.query(`DROP TABLE "table"`);
        await queryRunner.query(`DROP TYPE "public"."table_status_enum"`);
    }

}
