-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productName" TEXT NOT NULL DEFAULT 'Produto Desconhecido',
ADD COLUMN     "userName" TEXT NOT NULL DEFAULT 'Usuário Desconhecido';
