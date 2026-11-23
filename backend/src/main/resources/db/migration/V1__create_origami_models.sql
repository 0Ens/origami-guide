-- An origami model (e.g. "dog-face") and the paper it should be folded from.
CREATE TABLE origami_models (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          VARCHAR(64)  NOT NULL UNIQUE,
    difficulty    VARCHAR(20)  NOT NULL
                  CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    sort_order    INT          NOT NULL DEFAULT 0,
    paper_size_cm NUMERIC(4,1) NOT NULL CHECK (paper_size_cm > 0),
    paper_type    VARCHAR(20)  NOT NULL
                  CHECK (paper_type IN ('KAMI', 'PRINTER', 'FOIL', 'WASHI')),
    front_color   VARCHAR(7)   NOT NULL CHECK (front_color ~ '^#[0-9a-fA-F]{6}$'),
    back_color    VARCHAR(7)   NOT NULL CHECK (back_color  ~ '^#[0-9a-fA-F]{6}$'),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Human-readable texts, one row per language ("en", "tr", ...).
CREATE TABLE origami_model_translations (
    model_id   BIGINT       NOT NULL REFERENCES origami_models (id) ON DELETE CASCADE,
    locale     VARCHAR(5)   NOT NULL,
    title      VARCHAR(100) NOT NULL,
    summary    VARCHAR(500) NOT NULL,
    paper_note VARCHAR(300),
    PRIMARY KEY (model_id, locale)
);
