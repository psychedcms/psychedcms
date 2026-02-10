<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\TextareaField;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Content\ContentTrait;
use PsychedCms\Taxonomy\Attribute\EntityTaxonomyField;
use PsychedCms\Taxonomy\Attribute\TaxonomyField;
use PsychedCms\Taxonomy\Entity\Taxonomy;
use PsychedCms\Taxonomy\Filter\TaxonomySlugFilter;
use PsychedCms\Workflow\Content\PublicationWorkflowAwareInterface;
use PsychedCms\Workflow\Content\PublicationWorkflowTrait;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\Table(name: 'posts')]
#[ORM\Index(columns: ['status'], name: 'idx_posts_status')]
#[ORM\Index(columns: ['author_id'], name: 'idx_posts_author_id')]
#[ApiResource(mercure: true)]
#[ApiFilter(TaxonomySlugFilter::class, properties: ['tags'])]
#[ContentType(icon: 'Article')]
class Post implements PublicationWorkflowAwareInterface
{
    use ContentTrait;
    use PublicationWorkflowTrait;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[TextField(label: 'Title', required: true, group: 'content')]
    private ?string $title = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[TextareaField(label: 'Excerpt', group: 'content')]
    private ?string $excerpt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Content', group: 'content')]
    private ?string $content = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $author = null;

    #[ORM\ManyToMany(targetEntity: Taxonomy::class)]
    #[ORM\JoinTable(name: 'post_tags')]
    #[TaxonomyField(taxonomy: 'tags', multiple: true, allowCreate: true, label: 'Tags', group: 'metadata')]
    private Collection $tags;

    #[ORM\ManyToMany(targetEntity: Genre::class)]
    #[ORM\JoinTable(name: 'post_genres')]
    #[EntityTaxonomyField(multiple: true, label: 'Genres', group: 'metadata')]
    private Collection $genres;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
        $this->genres = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getExcerpt(): ?string
    {
        return $this->excerpt;
    }

    public function setExcerpt(?string $excerpt): static
    {
        $this->excerpt = $excerpt;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, Taxonomy>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(Taxonomy $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }

        return $this;
    }

    public function removeTag(Taxonomy $tag): static
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    /**
     * @return Collection<int, Genre>
     */
    public function getGenres(): Collection
    {
        return $this->genres;
    }

    public function addGenre(Genre $genre): static
    {
        if (!$this->genres->contains($genre)) {
            $this->genres->add($genre);
        }

        return $this;
    }

    public function removeGenre(Genre $genre): static
    {
        $this->genres->removeElement($genre);

        return $this;
    }
}
