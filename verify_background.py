from playwright.sync_api import sync_playwright
import base64
import os

def get_css_content():
    # Basic CSS derived from the TimerPage.tsx styles we observed
    font_face = """
@font_face {
  font-family: 'Audiowide';
  src: url("https://fonts.gstatic.com/s/audiowide/v9/l7gdbjpo0cum0ckerdtama.woff2") format('woff2');
  font-weight: 400;
  font-style: normal;
}
@font_face {
  font-family: 'Rajdhani';
  src: url("https://fonts.gstatic.com/s/rajdhani/v10/LDIxapCSOBg7z1y0fUBxlA.woff2") format('woff2');
  font-weight: 400;
  font-style: normal;
}
"""
    return font_face

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        css = get_css_content()

        # Load image as base64
        try:
            with open("public/background.jpg", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                img_src = f'data:image/jpeg;base64,{encoded_string}'
        except FileNotFoundError:
            print("Error: public/background.jpg not found!")
            return

        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Timer Page Test</title>
            <style>
                {css}
                body {{
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    background-color: #000;
                    color: white;
                    font-family: 'Rajdhani', sans-serif;
                }}
            </style>
        </head>
        <body>
            <!-- Background -->
            <div style="position: fixed; inset: 0; z-index: 0;">
                <img src="{img_src}" style="width: 100%; height: 100%; object-fit: cover; filter: blur(10px) brightness(0.6);" />
                <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, #050505 100%); opacity: 0.6;"></div>
            </div>

            <!-- Content overlay to prove z-index -->
            <div style="position: relative; z-index: 10; padding: 50px; text-align: center;">
                <h1 style="font-family: 'Audiowide'; font-size: 3rem; color: #00f3ff;">BACKGROUND TEST</h1>
            </div>
        </body>
        </html>
        """

        page.set_content(html_content)
        page.screenshot(path="public/debug_screenshot.png")
        print("Screenshot saved to public/debug_screenshot.png")
        browser.close()

if __name__ == "__main__":
    main()
