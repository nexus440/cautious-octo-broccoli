import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import ProjectUpdatesApp from './ProjectUpdatesApp';

export interface IProjectUpdatesAppWebPartProps {
  context: IReadonlyTheme;
}

export default class ProjectUpdatesAppWebPart extends BaseClientSideWebPart<IProjectUpdatesAppWebPartProps> {

  public render(): void {
    const element: React.ReactElement<any> = React.createElement(
      ProjectUpdatesApp,
      {
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return Promise.resolve();
  }


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

}