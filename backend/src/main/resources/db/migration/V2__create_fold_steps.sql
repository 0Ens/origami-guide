-- One fold instruction of a model. The fold geometry definition is stored as
-- JSONB because the client-side fold engine owns its structure (see ADR-0002).
CREATE TABLE fold_steps (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    model_id    BIGINT NOT NULL REFERENCES origami_models (id) ON DELETE CASCADE,
    step_number INT    NOT NULL CHECK (step_number > 0),
    fold        JSONB  NOT NULL,
    UNIQUE (model_id, step_number)
);

CREATE TABLE fold_step_translations (
    step_id     BIGINT        NOT NULL REFERENCES fold_steps (id) ON DELETE CASCADE,
    locale      VARCHAR(5)    NOT NULL,
    instruction VARCHAR(500)  NOT NULL,
    PRIMARY KEY (step_id, locale)
);
