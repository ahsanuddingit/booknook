"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ImageIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, ApiError, apiFetch } from "@/lib/api";
import { cn } from "cn";

const CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const;

type FormValues = {
  title: string;
  author: string;
  category: string;
  description: string;
  image: string;
  totalCopies: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  title: "",
  author: "",
  category: "",
  description: "",
  image: "",
  totalCopies: "1",
};

const fieldClass =
  "h-11 rounded-xl border-line bg-white px-3.5 text-sm shadow-none placeholder:text-ink-muted/55 focus-visible:border-brand focus-visible:ring-brand/15";

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.title.trim().length < 2) {
    errors.title = "Give the book a title of at least 2 characters.";
  }

  if (values.author.trim().length < 2) {
    errors.author = "Add the author name.";
  }

  if (!values.category) {
    errors.category = "Choose the category that fits best.";
  }

  if (values.description.trim().length < 20) {
    errors.description =
      "Write at least 20 characters so readers know what to expect.";
  }

  const image = values.image.trim();
  if (!image) {
    errors.image = "Add a link to the cover image.";
  } else if (!/^(https?:\/\/|\/)/i.test(image)) {
    errors.image = "Use a full https:// image URL or a path starting with /.";
  }

  const copies = Number(values.totalCopies);
  if (!Number.isInteger(copies) || copies < 1 || copies > 99) {
    errors.totalCopies = "Enter a whole number between 1 and 99.";
  }

  return errors;
}

export function AddBookForm() {
  const { user } = useAuth();
  const formId = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    title: string;
    id: string;
  } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const ids = {
    title: `${formId}-title`,
    author: `${formId}-author`,
    category: `${formId}-category`,
    description: `${formId}-description`,
    image: `${formId}-image`,
    totalCopies: `${formId}-copies`,
    userName: `${formId}-username`,
    userEmail: `${formId}-useremail`,
  };

  const previewSrc = values.image.trim();
  const showPreview =
    previewSrc.length > 0 &&
    !imageFailed &&
    /^(https?:\/\/|\/)/i.test(previewSrc);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current
    );
    if (field === "image") setImageFailed(false);
  }

  function validateOne(field: keyof FormValues) {
    const message = validate(values)[field];
    setErrors((current) => ({ ...current, [field]: message }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>("[data-add-book-form] [aria-invalid='true']")
          ?.focus();
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch<{
        acknowledged: boolean;
        insertedId: string;
      }>("/books", {
        method: "POST",
        body: JSON.stringify({
          title: values.title.trim(),
          author: values.author.trim(),
          category: values.category,
          description: values.description.trim(),
          image: values.image.trim(),
          totalCopies: Number(values.totalCopies),
          userEmail: user?.email,
          userName: user?.name,
          addedDate: new Date().toISOString(), // Saving the date it was added
        }),
      });

      setCreated({ title: values.title.trim(), id: result.insertedId });
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(
          error.status === 401
            ? "The API could not verify your session. Sign in again so a valid BetterAuth token is available, then try once more."
            : error.message
        );
      } else if (error instanceof TypeError) {
        setSubmitError(
          `Could not reach the BookNook API at ${API_URL}. Make sure the server is running and NEXT_PUBLIC_API_URL is set correctly.`
        );
      } else {
        setSubmitError("Something went wrong while saving the book. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-brand/15 bg-white p-8 text-center shadow-[0_30px_70px_-50px_rgba(47,44,61,0.45)] sm:p-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2Icon className="size-7" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-3xl">
            Book added to the nook
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
            <span className="font-semibold text-ink">{created.title}</span> is
            now live on the shelf. Readers can find it in All Books and borrow
            one of its copies.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/books"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 rounded-full px-6"
              )}
            >
              Browse Books
              <ArrowRightIcon className="size-4" />
            </Link>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCreated(null)}
              className="h-11 gap-2 rounded-full border-line px-6"
            >
              <RotateCcwIcon className="size-4" />
              Add another book
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <form
        data-add-book-form
        noValidate
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_24px_60px_-55px_rgba(47,44,61,0.45)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Book details</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Tell readers what makes this book worth borrowing.
            </p>
          </div>
          <span className="hidden rounded-full bg-brand-tint px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-brand uppercase sm:inline">
            New listing
          </span>
        </div>

        {submitError ? (
          <div
            role="alert"
            className="mt-6 flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
          >
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            <p>{submitError}</p>
          </div>
        ) : null}

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {/* Book Title */}
          <div className="sm:col-span-2">
            <Label htmlFor={ids.title} className="text-[13px] font-semibold text-ink">
              Book title <span className="text-brand">*</span>
            </Label>
            <Input
              id={ids.title}
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              onBlur={() => validateOne("title")}
              placeholder="The Night Circus"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? `${ids.title}-error` : undefined}
              className={cn(fieldClass, "mt-2")}
            />
            {errors.title ? (
              <p id={`${ids.title}-error`} className="mt-1.5 text-xs text-destructive">
                {errors.title}
              </p>
            ) : null}
          </div>

          {/* Author Name */}
          <div>
            <Label htmlFor={ids.author} className="text-[13px] font-semibold text-ink">
              Author <span className="text-brand">*</span>
            </Label>
            <Input
              id={ids.author}
              value={values.author}
              onChange={(event) => updateField("author", event.target.value)}
              onBlur={() => validateOne("author")}
              placeholder="Erin Morgenstern"
              autoComplete="off"
              aria-invalid={Boolean(errors.author)}
              aria-describedby={errors.author ? `${ids.author}-error` : undefined}
              className={cn(fieldClass, "mt-2")}
            />
            {errors.author ? (
              <p id={`${ids.author}-error`} className="mt-1.5 text-xs text-destructive">
                {errors.author}
              </p>
            ) : null}
          </div>

          {/* Category Select Box */}
          <div>
            <Label htmlFor={ids.category} className="text-[13px] font-semibold text-ink">
              Category <span className="text-brand">*</span>
            </Label>
            <div className="relative mt-2">
              <select
                id={ids.category}
                value={values.category}
                onChange={(event) => updateField("category", event.target.value)}
                onBlur={() => validateOne("category")}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? `${ids.category}-error` : undefined
                }
                className={cn(
                  fieldClass,
                  "w-full appearance-none pr-10 text-ink aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
                  !values.category && "text-ink-muted/70"
                )}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-muted"
              />
            </div>
            {errors.category ? (
              <p id={`${ids.category}-error`} className="mt-1.5 text-xs text-destructive">
                {errors.category}
              </p>
            ) : null}
          </div>

          {/* Total Copies */}
          <div>
            <Label htmlFor={ids.totalCopies} className="text-[13px] font-semibold text-ink">
              Total copies <span className="text-brand">*</span>
            </Label>
            <Input
              id={ids.totalCopies}
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={values.totalCopies}
              onChange={(event) => updateField("totalCopies", event.target.value)}
              onBlur={() => validateOne("totalCopies")}
              aria-invalid={Boolean(errors.totalCopies)}
              aria-describedby={
                errors.totalCopies ? `${ids.totalCopies}-error` : undefined
              }
              className={cn(fieldClass, "mt-2")}
            />
            {errors.totalCopies ? (
              <p
                id={`${ids.totalCopies}-error`}
                className="mt-1.5 text-xs text-destructive"
              >
                {errors.totalCopies}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-muted">
                Available copies start equal to this number.
              </p>
            )}
          </div>

          {/* Cover Image URL */}
          <div>
            <Label htmlFor={ids.image} className="text-[13px] font-semibold text-ink">
              Cover image URL <span className="text-brand">*</span>
            </Label>
            <Input
              id={ids.image}
              type="url"
              value={values.image}
              onChange={(event) => updateField("image", event.target.value)}
              onBlur={() => validateOne("image")}
              placeholder="https://images.example.com/cover.jpg"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.image)}
              aria-describedby={errors.image ? `${ids.image}-error` : undefined}
              className={cn(fieldClass, "mt-2")}
            />
            {errors.image ? (
              <p id={`${ids.image}-error`} className="mt-1.5 text-xs text-destructive">
                {errors.image}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-muted">
                A direct link works best (imgbb / postimage).
              </p>
            )}
          </div>

          {/* Read-only User Name & Email */}
          <div>
            <Label htmlFor={ids.userName} className="text-[13px] font-semibold text-ink">
              User Name (Logged In)
            </Label>
            <Input
              id={ids.userName}
              value={user?.name || "Loading user..."}
              readOnly
              disabled
              className={cn(fieldClass, "mt-2 bg-slate-50 text-ink-muted cursor-not-allowed")}
            />
          </div>

          <div>
            <Label htmlFor={ids.userEmail} className="text-[13px] font-semibold text-ink">
              User Email (Logged In)
            </Label>
            <Input
              id={ids.userEmail}
              value={user?.email || "Loading email..."}
              readOnly
              disabled
              className={cn(fieldClass, "mt-2 bg-slate-50 text-ink-muted cursor-not-allowed")}
            />
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor={ids.description}
                className="text-[13px] font-semibold text-ink"
              >
                Short Description <span className="text-brand">*</span>
              </Label>
              <span className="text-[11px] font-medium text-ink-muted tabular-nums">
                {values.description.trim().length} characters
              </span>
            </div>
            <Textarea
              id={ids.description}
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              onBlur={() => validateOne("description")}
              placeholder="What is the book about, and who would love it?"
              rows={5}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? `${ids.description}-error` : undefined
              }
              className="mt-2 min-h-[128px] rounded-xl border-line bg-white px-3.5 py-3 text-sm shadow-none placeholder:text-ink-muted/55 focus-visible:border-brand focus-visible:ring-brand/15"
            />
            {errors.description ? (
              <p
                id={`${ids.description}-error`}
                className="mt-1.5 text-xs text-destructive"
              >
                {errors.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setValues(INITIAL_VALUES);
              setErrors({});
              setSubmitError(null);
              setImageFailed(false);
            }}
            disabled={submitting}
            className="h-10 rounded-full px-4 text-ink-muted hover:text-ink"
          >
            <RotateCcwIcon className="size-4" />
            Clear form
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="h-11 gap-2 rounded-full px-6"
          >
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Adding book...
              </>
            ) : (
              <>
                <PlusIcon className="size-4" />
                Add Book
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Live Preview Sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_24px_60px_-55px_rgba(47,44,61,0.45)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="text-[11px] font-bold tracking-[0.14em] text-ink-muted uppercase">
              Live preview
            </p>
            <SparklesIcon className="size-4 text-brand" />
          </div>

          <div className="p-5">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-brand-tint">
              {showPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={previewSrc}
                  src={previewSrc}
                  alt=""
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-ink-muted">
                  {imageFailed ? (
                    <ImageIcon className="size-8 text-brand/50" />
                  ) : (
                    <BookOpenIcon className="size-8 text-brand/50" />
                  )}
                  <p className="text-xs leading-5">
                    {imageFailed
                      ? "That image could not be loaded. Check the URL."
                      : "Your cover will appear here once you add an image link."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5">
              {values.category ? (
                <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-brand uppercase">
                  {values.category}
                </span>
              ) : null}
              <h3 className="mt-2 line-clamp-2 text-lg leading-snug font-bold text-ink">
                {values.title.trim() || "Your book title"}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                {values.author.trim() || "Author name"}
              </p>
              <p className="mt-3 line-clamp-3 text-xs leading-5 text-ink-muted">
                {values.description.trim() ||
                  "A short description will help the right reader find this book."}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[11px] font-medium text-ink-muted">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {Number(values.totalCopies) > 0
                  ? `${values.totalCopies} ${
                      Number(values.totalCopies) === 1 ? "copy" : "copies"
                    } available`
                  : "Add at least one copy"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}