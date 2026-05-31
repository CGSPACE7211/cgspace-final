import { NextResponse } from 'next/server';

export const revalidate = 1; 

export async function GET() {
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

    const menuItems = [];
    let posterImages = [];
    let unitImage = null;
    let logoImage = null;

    data.results.forEach(page => {
      const props = page.properties;
      const active = props.Active?.checkbox || false;
      if (!active) return;

      const name = props.Name?.title[0]?.plain_text || '';
      const category = props.Category?.select?.name || '';
      // 🚀 新增：读取你在 Notion 填写的屏幕编号，如果没填就默认是 'ALL' (全屏显示)
      const screen = props.Screen?.select?.name || 'ALL';
      
      const files = props.Image?.files || [];
      const urls = files.map(f => f.file?.url || f.external?.url).filter(Boolean);

      if (name.toUpperCase() === 'UNIT') {
        unitImage = urls[0] || null;
      } else if (name.toUpperCase() === 'LOGO') {
        logoImage = urls[0] || null;
      } else if (category.toUpperCase() === 'POSTER') {
        // 把海报链接和对应的屏幕编号一起存起来
        urls.forEach(url => posterImages.push({ url, screen }));
      } else {
        menuItems.push({
          id: page.id,
          name,
          price: props.Price?.number || 0,
          category: category || 'Others',
          specialTag: props.Special_Tag?.rich_text[0]?.plain_text || '',
          screen // 把菜单的屏幕编号也存起来
        });
      }
    });

    return NextResponse.json({ success: true, menuItems, posterImages, unitImage, logoImage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
