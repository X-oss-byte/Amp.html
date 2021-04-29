---
$category@: social
formats:
  - websites
  - stories
teaser:
  text: Displays Iframely-powered rich media embeds from over 1900 publishers and card previews for other URLs
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# amp-iframely

Embeds and displays <a href="https://iframely.com">Iframely</a>-powered rich media from over 1900 third party publishers. Shows URL previews as summary card for any other URL.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-iframely" src="https://cdn.ampproject.org/v0/amp-iframely-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>responsive, fixed-height</td>
  </tr>
</table>

## Overview

The `amp-iframely` connects you to Iframely cloud service. It provides responsive embeds codes and rich media support for over 1900 third party publishers. Plus summary cards as URL previews for the rest of the Internet.

You'd likely get `amp-iframely` code generated by from Iframely APIs. But you may also skip making API calls and use Iframely in AMP directly (we recommend responsive layout, with resizable flag in that case).

Please get your API key at <a href="https://iframely.com">iframely.com</a>.

#### Example: Embed third party via content ID

[example preview="inline" playground="true" imports="amp-iframely"][sourcecode:html]
<amp-iframely width="400" height="225"
    data-id="I8NNa1s"
    layout="responsive"
    data-img>
</amp-iframely>
[/sourcecode][/example]

#### Example: Summary card for any URL via API key

[example preview="inline" playground="true" imports="amp-iframely"][sourcecode:html]
<amp-iframely height="140"
    data-url="https://iframely.com"
    data-key="30ef29b325c50219755786a371c281ad"
    layout="fixed-height"
    resizable>
</amp-iframely>
[/sourcecode][/example]

Feel free to try any URL with the API key from the above example. However, it is restricted for use on amp.dev only.

## Attributes

### Indentifying

There are two ways to identify rich media. Either with the help of Iframely-issued ID, or with a pair of media URL and your API key (MD5-hashed for security reasons):

<table>
  <tr>
    <td width="40%"><strong>data-id</strong></td>
    <td>Iframely <a href="https://iframely.com/docs/ids">content ID</a>, if available</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-url</strong></td>
    <td><p>Alternatively, if no content ID, identify rich media by its canonical URL.</p>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>data-key</strong></td>
    <td><p>If <code>data-url</code> is used, also add the MD5 hash of your Iframely API key as <code>data-key</code> attribute. Hash your key, the unencrypted value won't work here.</p>
    </td>
  </tr>
</table>

### Placing

`amp-iframely` supports responsive and fixed-height layouts:

<table>
  <tr>
    <td width="40%"><strong>width</strong> and <strong>height</strong></td>
    <td>Use both attributes for responsive media to define its aspect-ratio. Use only height for a fixed-height layout. If you don't have media sizes - use what works best as a placeholder, and add <code>resizable</code> as below.</td>
  </tr> 
  <tr>
    <td width="40%"><strong>resizable</strong></strong></td>
    <td>A flag to add event listener and adjust component's height automatically to fit and match the rich media content. This works with both responsive and fixed-height layouts.</td>
  </tr> 
  <tr>
    <td width="40%"><strong>data-img</strong></td>
    <td><strong>Empty</strong> attribute, indicating that rich media's thumbnail image should be used as a placeholder while the component and its content loads. No value please - Iframely will find the reqiured image address on its own.</td>
  </tr>
</table>

Any other of Iframely's query-string <a href="https://iframely.com/docs/parameters">API parameters</a> can be passed as <code>data-</code> prefixed attribute. For example, <code>align="left"</code> API parameter becomes <code>data-align="left"</code> attribute. Custom <a href="https://iframely.com/docs/options">provider-specific options</a> can also be passed as <code>data-</code> attribute.

## Validation

As a mininum, either `data-id` attribute or a pair of `data-url` and `data-key` are required to identify the third party rich media content and authenticate with Iframely.