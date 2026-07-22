"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLACES } from "@/lib/locations";
import { PROPERTY_TYPES, getLayoutsForType } from "@/lib/property";
import {
  PropertyPhotoPicker,
  type ListingPhoto,
} from "./PropertyPhotoPicker";
import {
  PropertyVideoPicker,
  type ListingVideo,
} from "./PropertyVideoPicker";
import { SiteHeader } from "./SiteHeader";
import "@/app/list-form.css";

export function ListRentForm() {
  const router = useRouter();
  const district = "kathmandu" as const;
  const [ready, setReady] = useState(false);
  const [place, setPlace] = useState("");
  const [landmark, setLandmark] = useState("");
  const [propertyType, setPropertyType] = useState<
    "room" | "flat" | "commercial" | ""
  >("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const [parkingTwo, setParkingTwo] = useState(false);
  const [parkingFour, setParkingFour] = useState(false);
  const [noParking, setNoParking] = useState(false);
  const [twoWheelerCount, setTwoWheelerCount] = useState("");
  const [fourWheelerCount, setFourWheelerCount] = useState("");
  const [otherFacilities, setOtherFacilities] = useState("");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"agent" | "homeowner" | "">("");
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [video, setVideo] = useState<ListingVideo | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const places = PLACES.kathmandu;

  const layoutOptions = useMemo(
    () => (propertyType ? getLayoutsForType(propertyType) : []),
    [propertyType],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function selectNoParking() {
    setNoParking(true);
    setParkingTwo(false);
    setParkingFour(false);
    setTwoWheelerCount("");
    setFourWheelerCount("");
  }

  function toggleTwoWheeler() {
    setNoParking(false);
    setParkingTwo((current) => {
      const next = !current;
      if (!next) setTwoWheelerCount("");
      return next;
    });
  }

  function toggleFourWheeler() {
    setNoParking(false);
    setParkingFour((current) => {
      const next = !current;
      if (!next) setFourWheelerCount("");
      return next;
    });
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed");
        return null;
      }
      return data.path as string;
    } catch {
      setError("Image upload failed");
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadVideo(file: File): Promise<string | null> {
    setUploadingVideo(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Video upload failed");
        return null;
      }
      return data.path as string;
    } catch {
      setError("Video upload failed");
      return null;
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!place || !role || !propertyType || !propertyDetails || !price) {
      setError("Please complete all required fields.");
      return;
    }

    if (!noParking && !parkingTwo && !parkingFour) {
      setError("Select parking options or No parking.");
      return;
    }

    if (parkingTwo && (!twoWheelerCount || Number(twoWheelerCount) < 1)) {
      setError("Enter number of 2 wheelers.");
      return;
    }

    if (parkingFour && (!fourWheelerCount || Number(fourWheelerCount) < 1)) {
      setError("Enter number of 4 wheelers.");
      return;
    }

    if (uploadingImage || uploadingVideo) {
      setError("Please wait for the upload to finish.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const imagePaths = photos.map((photo) => photo.path);

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          place,
          landmark,
          property_type: propertyType,
          property_details: propertyDetails,
          price: Number(price),
          parking_two_wheeler: parkingTwo ? Number(twoWheelerCount) : 0,
          parking_four_wheeler: parkingFour ? Number(fourWheelerCount) : 0,
          other_facilities: otherFacilities.trim(),
          name,
          phone,
          role,
          image_paths: imagePaths,
          display_image_index: photos.length > 0 ? displayIndex : 0,
          video_path: video?.path ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setSuccess(true);
      setTimeout(() => router.push("/"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader showBack />
      <main className={`list-form-page flex-1 ${ready ? "is-ready" : ""}`}>
        <div className="list-form-shell">
          <header className="list-form-hero">
            <span className="list-form-kicker">List · Built Himalayas</span>
            <h1 className="list-form-title">Your Property Details</h1>
            <p className="list-form-subtitle">
              Share details and we will show your rent to interested tenants.
            </p>
          </header>

          {success ? (
            <div className="list-form-success">
              <div className="list-form-success-icon" aria-hidden>
                ✓
              </div>
              <h2>Listing submitted!</h2>
              <p>
                Your property is now pending review and will appear once
                approved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="list-form-card">
              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Location</h2>
                  <p className="list-form-section-note">
                    Where is this rental located?
                  </p>
                </div>
                <div className="list-form-fields two-col">
                  <Field label="District">
                    <select
                      required
                      value={district}
                      disabled
                      className="field-input disabled:opacity-80"
                    >
                      <option value="kathmandu">Kathmandu</option>
                    </select>
                  </Field>

                  <Field label="Area / Place">
                    <select
                      required
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      className="field-input"
                    >
                      <option value="">Select place</option>
                      {places.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Landmark" className="span-2">
                    <input
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="field-input"
                      placeholder="Near hospital, school, main road..."
                    />
                  </Field>
                </div>
              </section>

              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Property details</h2>
                  <p className="list-form-section-note">
                    Type, layout, parking and facilities.
                  </p>
                </div>
                <div className="list-form-fields two-col">
                  <Field label="Property type" className="span-2">
                    <div className="list-form-choice-grid cols-3">
                      {PROPERTY_TYPES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPropertyType(option.value);
                            setPropertyDetails("");
                          }}
                          className={`list-form-choice ${
                            propertyType === option.value ? "is-active" : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {propertyType === "commercial" && (
                    <Field label="Commercial details" className="span-2">
                      <textarea
                        required
                        value={propertyDetails}
                        onChange={(e) => setPropertyDetails(e.target.value)}
                        className="field-input"
                        placeholder="Shop size, floor, suitable for restaurant, office, etc."
                      />
                    </Field>
                  )}

                  {propertyType === "room" && (
                    <Field label="Room type">
                      <select
                        required
                        value={propertyDetails}
                        onChange={(e) => setPropertyDetails(e.target.value)}
                        className="field-input"
                      >
                        <option value="">Select room type</option>
                        {layoutOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {propertyType === "flat" && (
                    <Field label="Flat layout">
                      <select
                        required
                        value={propertyDetails}
                        onChange={(e) => setPropertyDetails(e.target.value)}
                        className="field-input"
                      >
                        <option value="">Select flat layout</option>
                        {layoutOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  <Field
                    label="Monthly rent (NPR)"
                    className={
                      propertyType === "room" || propertyType === "flat"
                        ? ""
                        : "span-2"
                    }
                  >
                    <input
                      required
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="field-input"
                      placeholder="e.g. 15000"
                    />
                  </Field>

                  <Field label="Parking" className="span-2">
                    <div className="list-form-choice-grid cols-3">
                      <button
                        type="button"
                        onClick={toggleFourWheeler}
                        className={`list-form-choice ${
                          parkingFour ? "is-active" : ""
                        }`}
                      >
                        4 Wheeler
                      </button>
                      <button
                        type="button"
                        onClick={toggleTwoWheeler}
                        className={`list-form-choice ${
                          parkingTwo ? "is-active" : ""
                        }`}
                      >
                        2 Wheeler
                      </button>
                      <button
                        type="button"
                        onClick={selectNoParking}
                        className={`list-form-choice ${
                          noParking ? "is-active" : ""
                        }`}
                      >
                        No parking
                      </button>
                    </div>

                    {(parkingTwo || parkingFour) && (
                      <div className="list-form-parking-counts">
                        {parkingTwo && (
                          <div className="list-form-field">
                            <span className="sub-label">No. of 2 wheelers</span>
                            <div className="list-form-field-control">
                              <input
                                required
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={twoWheelerCount}
                                onChange={(e) =>
                                  setTwoWheelerCount(e.target.value)
                                }
                                className="field-input"
                                placeholder="e.g. 2"
                              />
                            </div>
                          </div>
                        )}
                        {parkingFour && (
                          <div className="list-form-field">
                            <span className="sub-label">No. of 4 wheelers</span>
                            <div className="list-form-field-control">
                              <input
                                required
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={fourWheelerCount}
                                onChange={(e) =>
                                  setFourWheelerCount(e.target.value)
                                }
                                className="field-input"
                                placeholder="e.g. 1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Field>

                  <Field
                    label="Other Facilities (Water, Internet etc-)"
                    className="span-2"
                  >
                    <textarea
                      value={otherFacilities}
                      onChange={(e) => setOtherFacilities(e.target.value)}
                      className="field-input"
                      placeholder="Water, internet, balcony, solar, etc."
                    />
                  </Field>
                </div>
              </section>

              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Your details</h2>
                  <p className="list-form-section-note">
                    So tenants can reach the right contact.
                  </p>
                </div>
                <div className="list-form-fields two-col">
                  <Field label="Your name">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="field-input"
                      placeholder="Full name"
                    />
                    <p className="list-form-hint list-form-hint--spacer" aria-hidden>
                      Nepal mobile number (e.g. 98XXXXXXXX)
                    </p>
                  </Field>

                  <Field label="Phone number">
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="field-input"
                      placeholder="98XXXXXXXX"
                    />
                    <p className="list-form-hint">
                      Nepal mobile number (e.g. 98XXXXXXXX)
                    </p>
                  </Field>

                  <Field
                    label="Are you an agent or HouseOwner?"
                    className="span-2"
                  >
                    <div className="list-form-choice-grid cols-2">
                      {(["homeowner", "agent"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRole(option)}
                          className={`list-form-choice ${
                            role === option ? "is-active" : ""
                          }`}
                        >
                          {option === "homeowner" ? "HouseOwner" : "Agent"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field
                    label="Property photos (optional, up to 4)"
                    className="span-2"
                  >
                    <PropertyPhotoPicker
                      variant="glass"
                      photos={photos}
                      displayIndex={displayIndex}
                      uploading={uploadingImage}
                      onPhotosChange={setPhotos}
                      onDisplayIndexChange={setDisplayIndex}
                      onUpload={uploadPhoto}
                      onError={setError}
                    />
                  </Field>

                  <Field
                    label="Property video (optional)"
                    className="span-2"
                  >
                    <PropertyVideoPicker
                      variant="glass"
                      video={video}
                      uploading={uploadingVideo}
                      onVideoChange={setVideo}
                      onUpload={uploadVideo}
                      onError={setError}
                    />
                  </Field>
                </div>
              </section>

              {error && <p className="list-form-error mt-2">{error}</p>}

              <button
                type="submit"
                disabled={
                  loading ||
                  uploadingImage ||
                  uploadingVideo ||
                  !role ||
                  !propertyType ||
                  !propertyDetails
                }
                className="list-form-submit mt-3"
              >
                {loading ? "Submitting..." : "I want to list this"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`list-form-field ${className}`}>
      <span className="label">{label}</span>
      <div className="list-form-field-control">{children}</div>
    </div>
  );
}
