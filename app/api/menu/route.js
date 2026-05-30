import { NextResponse } from 'next/server';

export const revalidate = 1; // 1秒极速同步云端

export async function GET() {
  // ⚡ 已经为你自动填好你成功的两个开门暗号，千万不要改动它们！
  const NOTION_TOKEN = "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"; 
  const DATABASE_ID = "37045961808280f1945adb22e99baa17";

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Notion Sync Failed');
    const data = await response.json();

    const items = data.results.map(page => {
      const props = page.properties;
      return {
        id: page.id,
        name: props.Name?.title[0]?.plain_text || 'Unnamed',
        price: props.Price?.number || 0,
        category: props.Category?.select?.name || 'Others',
        active: props.Active?.checkbox || false,
        specialTag: props.Special_Tag?.rich_text[0]?.plain_text || '',
        // 🚀 核心黑科技：全自动捕捉你在 Notion 表格Image列里拖进来的精美设计图
        imageUrl: props.Image?.files[0]?.file?.url || props.Image?.files[0]?.external?.url || null
      };
    }).filter(item => item.active);

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
