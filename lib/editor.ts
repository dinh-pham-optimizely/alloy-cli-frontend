import { getTemplatePath } from './helpers';
import launch from 'launch-editor';

const editors = {
  CODE: 'code',
  CODE_INSIDERS: 'code-insiders',
  IDEA: 'idea',
  NOTEPAD: 'notepad++',
  SUBLIME: 'sublime',
  WEBSTORM: 'webstorm',
};

class Editor {
  editor: string;

  constructor(editor: string) {
    this.editor = editor;
  }

  async openFileWithEditor(fileName: string) {
    try {
      const originalFilePath = getTemplatePath(`${fileName}.txt`);

      try {
        launch(originalFilePath, this.editor, (fileName, error) =>
        {
          console.log(fileName, error, 'error inside');
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error('Please install this editor first!');
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

export { Editor, editors };
