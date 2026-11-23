package dev.origamiguide.api.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data generates the implementation at startup. The SQL is derived from the
 * method names, e.g. {@code findBySlug} becomes {@code where slug = ?}.
 */
public interface OrigamiModelRepository extends JpaRepository<OrigamiModel, Long> {

    List<OrigamiModel> findAllByOrderBySortOrderAscSlugAsc();

    Optional<OrigamiModel> findBySlug(String slug);
}
