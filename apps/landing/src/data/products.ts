export interface Product {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  path: string;
  available: boolean;
}

export const products: Product[] = [
  {
    id: 'oracle',
    step: 1,
    title: '财务基因解码',
    subtitle: '觉醒',
    description: '48题沉浸式人格测试，挖掘你的财务潜意识，输出专属4位DNA代码与人格报告。',
    color: '#d4a04a',
    path: '/oracle',
    available: true,
  },
  {
    id: 'sandbox',
    step: 2,
    title: '人生推演沙盘',
    subtitle: '推演',
    description: '带着你的DNA，在回合制文字冒险中推演30年财富曲线，体验不同选择下的平行人生。',
    color: '#7a9ca8',
    path: '/sandbox',
    available: false,
  },
  {
    id: 'compass',
    step: 3,
    title: '资产罗盘',
    subtitle: '掌控',
    description: '将沙盘推演转化为现实行动。真实的资产追踪、复盘与财富自由路线校准。',
    color: '#8b5a4a',
    path: '/compass',
    available: false,
  },
];
