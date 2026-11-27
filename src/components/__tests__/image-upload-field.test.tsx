import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ImageUploadField } from "@/components/image-upload-field";
import { getDictionary } from "@/lib/i18n";

describe("ImageUploadField", () => {
  it("renders the remove button at the top-right corner of the uploaded image box", () => {
    const enDict = getDictionary("en");
    const html = renderToStaticMarkup(
      <ImageUploadField
        id="logo-upload-test"
        label={enDict.shopLogo}
        uploadLabel={enDict.uploadLogo}
        removeLabel={enDict.removeLogo}
        value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
        preset="logo"
        dictionary={enDict}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-upload-tile="true"');
    expect(html).toContain('class="relative inline-block"');
    expect(html).toContain(`aria-label="${enDict.removeLogo}"`);
    expect(html).toContain("absolute -top-2 -right-2");
    expect(html).toContain("active:not-aria-[haspopup]:translate-y-0");
    expect(html).toContain("lucide-x");
    expect(html).not.toContain(`<span>${enDict.removeLogo}</span>`);
  });
});
