import { MarketplaceCategory } from '../../../types';

export const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  [MarketplaceCategory.BusinessStrategy]: '商业战略',
  [MarketplaceCategory.ContentCreation]: '内容创作',
  [MarketplaceCategory.CreatorEconomy]: '个人创作者',
  [MarketplaceCategory.DesignCreative]: '设计与创意',
  [MarketplaceCategory.Engineering]: '工程开发',
  [MarketplaceCategory.FinanceLegal]: '财务与法务',
  [MarketplaceCategory.LearningResearch]: '学习与研究',
  [MarketplaceCategory.Marketing]: '营销与增长',
  [MarketplaceCategory.Operations]: '运营与行政',
  [MarketplaceCategory.PeopleHR]: '人力资源与人员管理',
  [MarketplaceCategory.PersonalLife]: '个人生活',
  [MarketplaceCategory.ProductManagement]: '产品与项目管理',
  [MarketplaceCategory.SalesCustomer]: '销售与营收',
};

export const CATEGORY_DEFAULT_AVATAR: Record<MarketplaceCategory, string> = {
  [MarketplaceCategory.BusinessStrategy]: '📊',
  [MarketplaceCategory.ContentCreation]: '✍️',
  [MarketplaceCategory.CreatorEconomy]: '🎬',
  [MarketplaceCategory.DesignCreative]: '🎨',
  [MarketplaceCategory.Engineering]: '💻',
  [MarketplaceCategory.FinanceLegal]: '⚖️',
  [MarketplaceCategory.LearningResearch]: '📚',
  [MarketplaceCategory.Marketing]: '📢',
  [MarketplaceCategory.Operations]: '⚙️',
  [MarketplaceCategory.PeopleHR]: '👥',
  [MarketplaceCategory.PersonalLife]: '🌱',
  [MarketplaceCategory.ProductManagement]: '🚀',
  [MarketplaceCategory.SalesCustomer]: '💼',
};
