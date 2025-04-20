import { Test, TestingModule } from '@nestjs/testing';
import { NodeNplService } from './services/node-npl.service';

describe('NodeNplService', () => {
  let service: NodeNplService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeNplService],
    }).compile();

    service = module.get<NodeNplService>(NodeNplService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
