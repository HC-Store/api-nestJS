import { Test, TestingModule } from '@nestjs/testing';
import { ItemcarrinhoService } from './itemcarrinho.service.js';

describe('ItemcarrinhoService', () => {
  let service: ItemcarrinhoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemcarrinhoService],
    }).compile();

    service = module.get<ItemcarrinhoService>(ItemcarrinhoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
