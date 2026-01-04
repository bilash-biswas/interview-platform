import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathRenderProps {
  text: string;
  fontSize?: number;
  color?: string;
  style?: any;
}

const MathRender: React.FC<MathRenderProps> = ({ text, fontSize = 18, color = 'black', style }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
        <style>
          body { 
            font-size: ${fontSize}px; 
            color: ${color};
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden;
            background-color: transparent;
          }
          .math { text-align: center; width: 100%; }
        </style>
      </head>
      <body>
        <div id="content" class="math"></div>
        <script>
          window.onload = function() {
            const text = "${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}";
            const parts = text.split('$$');
            const content = document.getElementById('content');
            
            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                const span = document.createElement('span');
                try {
                  katex.render(part, span, { throwOnError: false, displayMode: true });
                  content.appendChild(span);
                } catch(e) {
                  const errorNode = document.createTextNode('$$' + part + '$$');
                  content.appendChild(errorNode);
                }
              } else {
                content.appendChild(document.createTextNode(part));
              }
            });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="small" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120, // Check height requirements
    width: '100%',
    backgroundColor: 'transparent'
  },
  webview: {
    backgroundColor: 'transparent',
    opacity: 0.99 // Fix for some android weirdness
  }
});

export default MathRender;
