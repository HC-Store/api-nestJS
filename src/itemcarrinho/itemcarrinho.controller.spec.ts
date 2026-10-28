import { Test, TestingModule } from '@nestjs/testing';
import { ItemcarrinhoController } from './itemcarrinho.controller.js';

describe('ItemcarrinhoController', () => {
  let controller: ItemcarrinhoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemcarrinhoController],
    }).compile();

    controller = module.get<ItemcarrinhoController>(ItemcarrinhoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
