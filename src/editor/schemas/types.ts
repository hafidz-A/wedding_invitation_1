/**
 * Schema-driven editor type definitions. A SectionSchema describes the
 * editable surface of one section type (matching a key in sectionRegistry).
 * <FieldEditor> walks the `fields` array and renders inputs generically.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'image'
  | 'imageArray'
  | 'objectArray'

export interface BaseField {
  key: string
  label: string
  help?: string
}

export interface TextField extends BaseField {
  type: 'text'
}
export interface TextareaField extends BaseField {
  type: 'textarea'
  rows?: number
}
export interface DatetimeField extends BaseField {
  type: 'datetime'
}
export interface BooleanField extends BaseField {
  type: 'boolean'
}
export interface SelectField extends BaseField {
  type: 'select'
  options: { value: string; label: string }[]
}
export interface ImageField extends BaseField {
  type: 'image'
}
export interface ImageArrayField extends BaseField {
  type: 'imageArray'
  /** When true, items are objects with a `src` (e.g. gallery.images[].src);
   *  otherwise items are plain URL strings (e.g. hero.blastPhotos[]). */
  itemIsObject?: boolean
  /** Property name of the URL when itemIsObject is true (default: 'src'). */
  urlKey?: string
}
export interface ObjectArrayField extends BaseField {
  type: 'objectArray'
  /** Sub-schema for each row in the array. */
  itemFields: FieldDef[]
  /** Template used when adding a new row. */
  newItem: Record<string, unknown>
  /** Label key from the item used in the row header (e.g. 'title', 'name'). */
  itemLabelKey?: string
}

export type FieldDef =
  | TextField
  | TextareaField
  | DatetimeField
  | BooleanField
  | SelectField
  | ImageField
  | ImageArrayField
  | ObjectArrayField

export interface SectionSchema {
  type: string
  label: string
  fields: FieldDef[]
  /** Initial props applied when this section is added via "+ Add section".
   *  Should be representative placeholder content (couple-name placeholder,
   *  Unsplash images, dummy stories) so the user sees the shape immediately. */
  defaults?: Record<string, unknown>
}
