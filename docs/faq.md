# FAQ


## How do I draw to the screen in luma.gl?

`device.context.getDefaultFramebuffer()` returns a special framebuffer that lets you render to screen (into the swap chain). Simply create a `RenderPass` with this framebuffer and start rendering.

## How do I clear the screen in luma.gl?

`Framebuffer` attachments are cleared by default when a RenderPass starts. More control are provided via the `clearColor` field on the attachments, by setting this the attachment will be cleared to the corresponding color. The default clear color is black [0, 0, 0, 0]. Clearing can also be disabled by setting `loadOp='load'`.


