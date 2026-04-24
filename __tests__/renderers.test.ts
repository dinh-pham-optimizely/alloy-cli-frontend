import { describe, it, expect } from 'vitest';

// NO MOCKS — renderers read real template files from public/templates/
// getTemplatePath() checks lib/templates/ (doesn't exist) → falls back to public/templates/ (exists)

import {
  renderComponentContent,
  renderTemplateComponent,
  renderPageComponent,
  renderComponentData,
  renderComponentType,
  renderComponentStyle,
  renderComponentState,
} from '../lib/renderers';

// ─── renderComponentContent ──────────────────────────────────────────────────

describe('renderComponentContent', () => {
  it('renders component with no script and no style', async () => {
    const result = await renderComponentContent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedScript: false,
      isNeedStyle: false,
    });

    // Comments should be stripped
    expect(result).not.toContain('<--');
    expect(result).not.toContain('-->');

    // Placeholders should be replaced
    expect(result).toContain("import { ProductCardModel } from '@_types/types'");
    expect(result).toContain('const ProductCard = (model: ProductCardModel)');
    expect(result).toContain("'xx-o-product-card'");
    expect(result).toContain('export default ProductCard');

    // No RequireJs/RequireCss imports
    expect(result).not.toContain('RequireJs');
    expect(result).not.toContain('RequireCss');
  });

  it('prepends RequireJs import when isNeedScript is true', async () => {
    const result = await renderComponentContent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedScript: true,
      isNeedStyle: false,
    });

    expect(result).toContain("import RequireJs from '@helpers/RequireJs'");
    expect(result).not.toContain('RequireCss');
    expect(result).toContain("<RequireJs path={'product-card'} defer />");
  });

  it('prepends RequireCss import when isNeedStyle is true', async () => {
    const result = await renderComponentContent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedScript: false,
      isNeedStyle: true,
    });

    expect(result).toContain("import RequireCss from '@helpers/RequireCss'");
    expect(result).not.toContain('RequireJs');
    expect(result).toContain("<RequireCss path={'b-product-card'} />");
  });

  it('prepends both imports when both script and style are needed', async () => {
    const result = await renderComponentContent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedScript: true,
      isNeedStyle: true,
    });

    expect(result).toContain("import RequireJs from '@helpers/RequireJs'");
    expect(result).toContain("import RequireCss from '@helpers/RequireCss'");
    expect(result).toContain("<RequireJs path={'product-card'} defer />");
    expect(result).toContain("<RequireCss path={'b-product-card'} />");
  });

  it('replaces all placeholders for atom type', async () => {
    const result = await renderComponentContent({
      componentName: 'Button',
      projectPrefix: 'ab',
      type: 'a',
    });

    expect(result).toContain("import { ButtonModel } from '@_types/types'");
    expect(result).toContain('const Button = (model: ButtonModel)');
    expect(result).toContain("'ab-a-button'");
    expect(result).toContain('export default Button');
  });
});

// ─── renderTemplateComponent ─────────────────────────────────────────────────

describe('renderTemplateComponent', () => {
  it('renders template with all placeholders replaced', async () => {
    const result = await renderTemplateComponent({ componentName: 'ProductCard' });

    expect(result).not.toContain('<--');
    expect(result).toContain("import { ProductCardModel } from '@_types/types'");
    expect(result).toContain("import ProductCard from '@organisms/product-card/ProductCard'");
    expect(result).toContain('productCardData?: ProductCardModel');
    expect(result).toContain('export const ProductCardTemplate = (model: Props)');
    expect(result).toContain('const { productCardData } = model');
    expect(result).toContain('<ProductCard {...productCardData} />');
    expect(result).toContain('export default ProductCardTemplate');
  });
});

// ─── renderPageComponent ─────────────────────────────────────────────────────

describe('renderPageComponent', () => {
  // BUG #2: page.txt uses ${componentName} in import path but the generated file is
  // {ComponentName}Template.tsx. The correct import should reference ProductCardTemplate,
  // not ProductCard. page-story.txt correctly uses ${componentTemplateName}.
  //
  // The real template produces:
  //   import { ProductCardTemplate } from '@templates/product-card/ProductCard'
  // But the correct output should be:
  //   import { ProductCardTemplate } from '@templates/product-card/ProductCardTemplate'
  it('renders standard page with correct template import path', async () => {
    const result = await renderPageComponent({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: false,
    });

    expect(result).not.toContain('<--');
    expect(result).toContain("import { productCardData } from '@data/product-card'");
    // This is the CORRECT expected import path — file is ProductCardTemplate.tsx
    expect(result).toContain("import { ProductCardTemplate } from '@templates/product-card/ProductCardTemplate'");
    expect(result).toContain('const ProductCardPage = ()');
    expect(result).toContain('<ProductCardTemplate productCardData={productCardData} />');
    expect(result).toContain('export default ProductCardPage');
  });

  it('renders page-story template with correct template import path', async () => {
    const result = await renderPageComponent({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: true,
    });

    expect(result).not.toContain('<--');
    expect(result).toContain("import { Story, StoryCollectionMeta } from '@_types/types'");
    // page-story.txt correctly uses ${componentTemplateName} — this should pass
    expect(result).toContain("import { ProductCardTemplate } from '@templates/product-card/ProductCardTemplate'");
    expect(result).toContain("import { productCardData } from '@data/product-card'");
    expect(result).toContain("$$name: 'ProductCard'");
    expect(result).toContain("$$path: 'productCard'");
    expect(result).toContain('export const defaultProductCardPage: Story');
    expect(result).toContain("name: 'Product Card - Default'");
    expect(result).toContain('<ProductCardTemplate productCardData={productCardData} />');
  });
});

// ─── renderComponentData ─────────────────────────────────────────────────────

describe('renderComponentData', () => {
  it('renders data file with correct model and variable names', async () => {
    const result = await renderComponentData({ componentName: 'ProductCard' });

    expect(result).not.toContain('<--');
    expect(result).toContain("import { ProductCardModel } from '@_types/types'");
    expect(result).toContain('const productCardData: ProductCardModel = {}');
    expect(result).toContain('export { productCardData }');
  });
});

// ─── renderComponentType ─────────────────────────────────────────────────────

describe('renderComponentType', () => {
  it('renders type interface extending BasedAtomicModel', async () => {
    const result = await renderComponentType({ componentName: 'ProductCard', type: 'o' });

    expect(result).not.toContain('<--');
    expect(result).toContain('interface ProductCardModel extends BasedAtomicModel {');
    expect(result).toContain('}');
  });
});

// ─── renderComponentStyle ────────────────────────────────────────────────────

describe('renderComponentStyle', () => {
  it('renders SCSS with correct class selector pattern', async () => {
    const result = await renderComponentStyle({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(result).not.toContain('<--');
    expect(result).toContain('.xx-o-product-card {');
  });

  it('uses correct type abbreviation for atom', async () => {
    const result = await renderComponentStyle({
      componentName: 'Button',
      projectPrefix: 'ab',
      type: 'a',
    });

    expect(result).toContain('.ab-a-button {');
  });
});

// ─── renderComponentState ────────────────────────────────────────────────────

describe('renderComponentState', () => {
  it('renders state JSON with correct name and selector', async () => {
    const result = await renderComponentState({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(result).not.toContain('<--');

    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('Product Card');
    expect(parsed.selector).toBe('.xx-o-product-card');
    expect(parsed.button).toEqual({ zIndex: 0, styleModifier: '' });
    expect(parsed.states).toEqual([]);
  });

  it('uses atom type in selector', async () => {
    const result = await renderComponentState({
      componentName: 'Button',
      projectPrefix: 'ab',
      type: 'a',
    });

    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('Button');
    expect(parsed.selector).toBe('.ab-a-button');
  });
});
