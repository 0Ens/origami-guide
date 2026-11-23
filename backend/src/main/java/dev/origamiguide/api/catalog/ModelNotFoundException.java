package dev.origamiguide.api.catalog;

public class ModelNotFoundException extends RuntimeException {

    private final String slug;

    public ModelNotFoundException(String slug) {
        super("No origami model with slug '" + slug + "'");
        this.slug = slug;
    }

    public String getSlug() {
        return slug;
    }
}
