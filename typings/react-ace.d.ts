/// <reference path="./main/ambient/react/index.d.ts"/>

declare namespace ReactAce {
    interface ReactAceProps extends __React.Props<ReactAce> {
        name:string,
        value:string,
        onChange:(newValue:string)=>void,
        width: string,
        height: string
    }

    interface ReactAce extends __React.ComponentClass<ReactAceProps> { }
}

declare module "react-ace" {
    const ace: ReactAce.ReactAce;
    export default ace;
}