#Created By: Tarun Chhabra

#Introduction:

Some time we have requirement we have to allow numeric fields only in input box. So instead of validation in function on component level we create directive for this. We have to just write only OnlyNumber="true" in input box where we have to allow only number 

#How To Use:

1) Import Files on shared-directive.module.ts 

import { OnlyNumberDirective } from './common-module/directive/only-number.directive';

and add refference in imports and export. shared-directive.module.ts import in app.module.ts

1) Import Files on component.module

import { OnlyNumberDirective } from '../common-module/directive/only-number.directive';

This will work on all respective component. 

#Note-
We create new module file with shared-directive.module.ts  because we have to use these directive in nested module. If will not use this then we have to face issue like you already import module on higher module etc..

#in HTML

<input type="text" OnlyNumber="true">

#Used On: 

Components:

demo-component/alpha-numeric






