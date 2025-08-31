import * as Blockly from 'blockly/core';

export type ToolboxCategory = { name: string; colour?: number|string; blocks?: Array<{ type: string; xml?: string }>; };
export type ToolboxData = { categories: ToolboxCategory[] };

const esc = (s: any) => String(s || '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export const buildToolboxXml = (data: ToolboxData): string => {
  if (!data || !Array.isArray(data.categories)) { return '<xml></xml>'; }
  const inner = data.categories.map(cat => {
    const blocks = (cat.blocks || []).map(b => {
      const type = b && b.type;
      if (!type || !Blockly.Blocks || !Blockly.Blocks[type]) { return ''; }
      const extra = b.xml ? b.xml : '';
      return `<block type="${esc(type)}">${extra}</block>`;
    }).join('');
    const colour = (cat.colour != null) ? ` colour="${cat.colour}"` : '';
    return `<category name="${esc(cat.name)}"${colour}>${blocks}</category>`;
  }).join('');
  return `<xml id="toolbox" style="display:none">${inner}</xml>`;
};

// Busca simples por nome de bloco dentro de categories
export const filterToolboxByQuery = (data: ToolboxData, query: string): ToolboxData => {
  if (!query) return data;
  const q = query.toLowerCase();
  const categories = (data.categories || []).map(cat => {
    const blocks = (cat.blocks || []).filter(b => (b.type || '').toLowerCase().includes(q));
    return { ...cat, blocks };
  }).filter(cat => (cat.blocks || []).length > 0);
  return { categories };
};


