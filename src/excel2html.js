const vscode = require("vscode");
const fs = require("fs");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");

module.exports = function (context) {
  let disposable = vscode.commands.registerCommand(
    "extension.excel2html",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      try {
        const uri = editor.document.uri;
        const filePath = uri.fsPath;

        // 读取文件内容
        const data = fs.readFileSync(filePath);

        // const isGB2312 = jschardet.detect(data).encoding === "GB2312";

        // console.log(isGB2312);
        // 使用 iconv-lite 转换为 GB2312 编码
        // const content = isGB2312
        //   ? data.toString()
        //   : iconv.decode(data, "GB2312");
        const content = iconv.decode(data, "GB2312");

        // 写入转换后的内容到文件
        fs.writeFileSync(filePath, content);
        vscode.window.showInformationMessage("1111111111");
        // // 在编辑器中执行替换操作
        editor.edit(editBuilder => {
          const end = new vscode.Position(editor.document.lineCount + 1, 0);
          let oldText = content;
          let matchTableExp = /<table[^>]*>([\s\S]*)<\/table>/g;
          let tableText = oldText.match(matchTableExp)[0];
          let noClass = tableText.replace(
            /(class|height|width|border|cellpadding|cellspacing)="\w*"/g,
            "",
          );
          let finalText = noClass.replace(
            /(\b(class|style)=)([^'"\s][^>\s]*|'[^']*'|"[^"]*"|'[^"]*'|"[^']*")/g,
            "$1$3",
          );

          let rightText = finalText.replace(/o:gfxdata="[^"]*"/g, "");
          let nexText = convertPtToPx(rightText);
          const text = nexText;

          editBuilder.replace(
            new vscode.Range(new vscode.Position(0, 0), end),
            text,
          );
        });

        vscode.window.showInformationMessage(
          "File converted to GB2312 encoding and HTML tags modified.22222222",
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting file: ${error.message}`,
        );
      }
    },
  );
  context.subscriptions.push(disposable);
};

function convertPtToPx(text) {
  return text.replace(/(\d+)pt/g, (match, p1) => {
    const pt = parseFloat(p1);
    const px = Number(Math.round(pt * 1.33333)); // Assume 1pt = 1.33333px
    return px.toString() + "px";
  });
}
