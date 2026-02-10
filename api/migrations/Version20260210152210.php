<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260210152210 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE genres RENAME COLUMN sort_order TO taxonomy_term_position');
        $this->addSql('ALTER TABLE taxonomies RENAME COLUMN sort_order TO taxonomy_term_position');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE genres RENAME COLUMN taxonomy_term_position TO sort_order');
        $this->addSql('ALTER TABLE taxonomies RENAME COLUMN taxonomy_term_position TO sort_order');
    }
}
