import {
  getComponentAsCamelCase,
  getComponentAsCapCaseWithSpacing,
  getComponentAsKebabCase,
  getComponentDataName,
  getComponentModelName,
  getComponentPageName,
  getComponentTemplateName,
  getTypeFullText,
  turnPascalCaseToCamelCase,
  turnPascalCaseToCapCaseWithSpacing,
  turnPascalCaseToKebabCase,
} from '../lib/helpers';

describe('test componentName getters', () =>
{
  const componentName = 'TestComponent';

  test('getComponentModelName should return correct value', () =>
  {
    const result = getComponentModelName(componentName);

    expect(result).toBe(`TestComponentModel`);
  });

  test('getComponentAsKebabCase should return correct value', () =>
  {
    const result = getComponentAsKebabCase(componentName);

    expect(result).toBe(`test-component`);
  });

  test('getComponentTemplateName should return correct value', () =>
  {
    const result = getComponentTemplateName(componentName);

    expect(result).toBe(`TestComponentTemplate`);
  });

  test('getComponentAsCamelCase should return correct value', () =>
  {
    const result = getComponentAsCamelCase(componentName);
    expect(result).toBe('testComponent');
  });

  test('getComponentDataName should return correct value', () =>
  {
    const result = getComponentDataName(componentName);
    expect(result).toBe('testComponentData');
  });

  test('getComponentPageName should return correct value', () =>
  {
    const result = getComponentPageName(componentName);
    expect(result).toBe('TestComponentPage');
  });

  test('getComponentAsCapCaseWithSpacing should return correct value', () =>
  {
    const result = getComponentAsCapCaseWithSpacing(componentName);
    expect(result).toBe('Test Component');
  });
});

describe('test text transformer', () =>
{

  test('turnPascalCaseToKebabCase should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToKebabCase(text);
    expect(result).toBe('test-component');

    text = 'HTTPResult';
    result = turnPascalCaseToKebabCase(text);

    expect(result).toBe('http-result');
  });

  test('turnPascalCaseToCamelCase should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToCamelCase(text);
    expect(result).toBe('testComponent');

    text = 'HTTPRequest';
    result = turnPascalCaseToCamelCase(text);
    expect(result).toBe('httpRequest');
  });

  test('turnPascalCaseToCapCaseWithSpacing should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToCapCaseWithSpacing(text);
    expect(result).toBe('Test Component');

    text = 'HTTPRequest';
    result = turnPascalCaseToCapCaseWithSpacing(text);
    expect(result).toBe('HTTP Request');
  });
});

describe('getTypeFullText', () =>
{
  test('getTypeFullText should return correct value with singular type', () =>
  {
    expect(getTypeFullText('o', false)).toBe('organism');
    expect(getTypeFullText('a', false)).toBe('atom');
    expect(getTypeFullText('m', false)).toBe('molecule');
  });

  test('getTypeFullText should return correct value with plural type', () =>
  {
    expect(getTypeFullText('o')).toBe('organisms');
    expect(getTypeFullText('a')).toBe('atoms');
    expect(getTypeFullText('m')).toBe('molecules');

  });
});
